import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@coveo/atomic-react', '@coveo/atomic'],
};

export default nextConfig;
