import {useState, useEffect, useRef} from 'react';
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Group,
  Select,
  Box,
  Stack,
} from '@mantine/core';
import {
  buildBackendProductListController,
  buildBackendPaginationController,
  buildBackendInteractiveProductController,
  type BackendProductListController,
  type BackendPaginationController,
} from '@coveo/thermidor';
import {
  converseController,
  generativeInterface,
} from '../../generative-setup.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {FacetPanel} from '../FacetPanel/FacetPanel.js';
import {SortDropdown} from '../SortDropdown/SortDropdown.js';
import {
  useUrlManager,
  useSessionTokenPersistence,
  useInitialUrlRestore,
} from '../../hooks/useUrlManager.js';
import styles from './BackendResults.module.css';

const PAGE_SIZE_OPTIONS = ['10', '25', '50'];

export function BackendResults() {
  const [interfaces, setInterfaces] = useState<
    Record<
      string,
      {type: string; display: string; state: Record<string, unknown>}
    >
  >({});
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
  });
  const controllersRef = useRef<{
    productList?: BackendProductListController;
    pagination?: BackendPaginationController;
    interfaceId?: string;
  }>({});

  const engine = generativeInterface[ENGINE];
  const stateId = generativeInterface[STATE_ID];

  useSessionTokenPersistence();
  useInitialUrlRestore();

  useEffect(() => {
    const selectors = getOrCreateBackendInterfacesSelectors(stateId);
    return engine.subscribe(selectors.getInterfaces, (newInterfaces) => {
      setInterfaces(newInterfaces);
    });
  }, [engine, stateId]);

  const firstInterfaceId = Object.keys(interfaces).find(
    (id) => interfaces[id]?.display === 'main'
  );

  useUrlManager(firstInterfaceId);

  useEffect(() => {
    if (
      !firstInterfaceId ||
      controllersRef.current.interfaceId === firstInterfaceId
    ) {
      if (firstInterfaceId && controllersRef.current.productList) {
        setProducts(controllersRef.current.productList.state.products);
        setPagination(controllersRef.current.pagination!.state);
      }
      return;
    }

    const productList = buildBackendProductListController({
      interface: generativeInterface,
      interfaceId: firstInterfaceId,
    });

    const paginationCtrl = buildBackendPaginationController({
      interface: generativeInterface,
      converseController,
      interfaceId: firstInterfaceId,
    });

    controllersRef.current = {
      productList,
      pagination: paginationCtrl,
      interfaceId: firstInterfaceId,
    };
    setProducts(productList.state.products);
    setPagination(paginationCtrl.state);

    const unsub1 = productList.subscribe(() =>
      setProducts(productList.state.products)
    );
    const unsub2 = paginationCtrl.subscribe(() =>
      setPagination(paginationCtrl.state)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [firstInterfaceId]);

  const query = (interfaces[firstInterfaceId!]?.state?.query as string) ?? '';
  const facets =
    (interfaces[firstInterfaceId!]?.state?.facets as Array<{
      facetId: string;
      field: string;
      displayName: string;
      type: string;
      values: Array<{
        value: string;
        state: 'idle' | 'selected' | 'excluded';
        numberOfResults: number;
      }>;
      moreValuesAvailable: boolean;
    }>) ?? [];

  if (!firstInterfaceId) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <FacetPanel interfaceId={firstInterfaceId} facets={facets} />
      </aside>

      <div className={styles.content}>
        {query && (
          <Text size="sm" mb="xs">
            Showing results for{' '}
            <Text span fw={700}>
              "{query}"
            </Text>
          </Text>
        )}

        <Group justify="space-between" align="center" mb="md">
          <Text size="sm" c="dimmed">
            {pagination.totalCount} results · Page {pagination.page + 1} of{' '}
            {pagination.totalPages}
          </Text>
          <Group gap="sm">
            <Group gap={4} align="center">
              <Text size="xs" c="dimmed">
                Per page
              </Text>
              <Select
                size="xs"
                w={70}
                data={PAGE_SIZE_OPTIONS}
                value={String(pagination.pageSize)}
                onChange={(val) => {
                  if (val) {
                    controllersRef.current.pagination?.setPageSize(Number(val));
                  }
                }}
                allowDeselect={false}
              />
            </Group>
            <SortDropdown interfaceId={firstInterfaceId} />
          </Group>
        </Group>

        <SimpleGrid cols={5} spacing="md">
          {products.map((product, i) => {
            const p = product as any;
            const position = pagination.page * pagination.pageSize + i + 1;
            return (
              <ProductCard
                key={p.permanentid ?? i}
                product={p}
                onClick={() => {
                  const interactive = buildBackendInteractiveProductController({
                    interface: generativeInterface,
                    converseController,
                    interfaceId: firstInterfaceId,
                    product: {
                      productId: p.permanentid ?? '',
                      name: p.ec_name ?? '',
                      price: p.ec_promo_price ?? p.ec_price ?? 0,
                    },
                    position,
                  });
                  interactive.select();
                }}
              />
            );
          })}
        </SimpleGrid>

        {pagination.totalPages > 1 && (
          <Group justify="center" mt="lg" gap="sm">
            <button
              className={styles.pageButton}
              disabled={pagination.page === 0}
              onClick={() =>
                controllersRef.current.pagination?.selectPage(
                  pagination.page - 1
                )
              }
            >
              ← Prev
            </button>
            <Text size="sm" c="dimmed">
              Page {pagination.page + 1} of {pagination.totalPages}
            </Text>
            <button
              className={styles.pageButton}
              disabled={pagination.page >= pagination.totalPages - 1}
              onClick={() =>
                controllersRef.current.pagination?.selectPage(
                  pagination.page + 1
                )
              }
            >
              Next →
            </button>
          </Group>
        )}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: any;
  onClick: () => void;
}

function ProductCard({product, onClick}: ProductCardProps) {
  const imageUrl = product.ec_thumbnails?.[0];
  const name = product.ec_name ?? 'Untitled';
  const price = product.ec_promo_price ?? product.ec_price;
  const originalPrice =
    product.ec_promo_price != null && product.ec_promo_price < product.ec_price
      ? product.ec_price
      : null;

  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      className={styles.card}
      onClick={onClick}
    >
      <Card.Section>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            h={140}
            fit="contain"
            bg="gray.0"
            p="xs"
          />
        ) : (
          <Box h={140} bg="gray.1" />
        )}
      </Card.Section>

      <Stack gap={4} mt="sm">
        <Text size="sm" fw={500} lineClamp={2} lh={1.3}>
          {name}
        </Text>
        <Group gap={6} align="baseline">
          <Text fw={700} size="md">
            ${price ?? '—'}
          </Text>
          {originalPrice && (
            <Text size="xs" td="line-through" c="dimmed">
              ${originalPrice}
            </Text>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
