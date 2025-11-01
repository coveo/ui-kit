'use client';

import {Suspense, use} from 'react';
import {Availability} from '@/lib/third-party-api-provider';
import {useAvailability} from './providers/availability-provider';

function SuspendedCustomAvailabilityBadge({productId}: {productId: string}) {
  const {getAvailabilityPromise} = useAvailability();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomAvailabilityBadge
        availabilityPromise={getAvailabilityPromise(productId)}
      />
    </Suspense>
  );
}

const CustomAvailabilityBadge = ({
  availabilityPromise,
}: {
  availabilityPromise: Promise<Availability> | undefined;
}) => {
  const availability = availabilityPromise ? use(availabilityPromise) : null;
  switch (availability) {
    case Availability.High:
      return <div>High Availability</div>;
    case Availability.Medium:
      return <div>Medium Availability</div>;
    case Availability.Low:
      return <div>Low Availability</div>;
    case Availability.OutOfStock:
      return <div>Out of stock</div>;
    default:
      return <div>Unknown Availability</div>;
  }
};

export {SuspendedCustomAvailabilityBadge as CustomAvailabilityBadge};
