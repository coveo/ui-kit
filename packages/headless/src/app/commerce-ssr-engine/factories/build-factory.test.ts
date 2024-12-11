import {Mock, describe, it, expect, vi} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../commerce-engine/commerce-engine-configuration.js';
import {CommerceEngineOptions} from '../../commerce-engine/commerce-engine.js';
import {buildLogger} from '../../logger.js';
import {SolutionType} from '../types/common.js';
import {buildFactory} from './build-factory.js';

vi.mock('../../logger.js');

describe('buildFactory', () => {
  const mockLogger = {
    warn: vi.fn(),
    debug: vi.fn(),
  };

  const engineOptions: CommerceEngineOptions = {
    configuration: getSampleCommerceEngineConfiguration(),
    navigatorContextProvider: vi.fn(),
  };

  const mockControllerDefinitions = {}; //TODO: populate

  beforeEach(() => {
    (buildLogger as Mock).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SSRCommerceEngine build process', () => {
    const solutionTypes = [
      SolutionType.search,
      SolutionType.listing,
      SolutionType.recommendation,
      SolutionType.standalone,
    ];

    test.each(solutionTypes)(
      'should build SSRCommerceEngine with %s solution type',
      async (solutionType) => {
        const factory = buildFactory(mockControllerDefinitions, engineOptions);
        const build = factory(solutionType);
        const result = await build();

        expect(result.engine).toBeDefined();
        expect(result.controllers).toBeDefined();
      }
    );
  });

  it('should warn if navigatorContextProvider is missing', async () => {
    const factory = buildFactory(mockControllerDefinitions, {
      configuration: getSampleCommerceEngineConfiguration(),
    });
    const build = factory(SolutionType.listing);

    await build();

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing navigator context in server-side code')
    );
  });

  it('should throw an error for unsupported solution type', async () => {
    const factory = buildFactory(mockControllerDefinitions, engineOptions);
    const build = factory('unsupported' as SolutionType);

    await expect(build()).rejects.toThrow('Unsupported solution type');
  });
});
