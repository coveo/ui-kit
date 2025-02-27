import {ChildProduct as HeadlessChildProduct} from '@coveo/headless/commerce';

interface IChildProductProps {
  headlessChildProduct: HeadlessChildProduct;
  promoteChildToParent: (product: HeadlessChildProduct) => void;
}

export default function ChildProduct(props: IChildProductProps) {
  const {headlessChildProduct, promoteChildToParent} = props;
  return (
    <button
      className="ChildProduct"
      key={headlessChildProduct.permanentid}
      onClick={() => promoteChildToParent!(headlessChildProduct)}
    >
      <img height="25px" src={headlessChildProduct.ec_images[0]}></img>
    </button>
  );
}
