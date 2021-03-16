import {createAsyncThunk} from '@reduxjs/toolkit';

export interface GetClassificationsRequest {
  fields: {[field: string]: string};
  context?: {[key: string]: any};
}

export const getClassifications = createAsyncThunk(
  'caseAssist/getClassifications',
  async (request: GetClassificationsRequest, thunkApi) => {
    console.log(`has request: ${request !== undefined}`);
    console.log(`has thunkApi: ${thunkApi !== undefined}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (request.fields.subject === 'error') {
      throw new Error('Boom!');
    }

    return {
      classifications: {
        fields: [
          {
            name: 'now',
            predictions: [
              {
                id: '3fe56ea0-1b98-4822-ad40-d42480c818d3',
                value: Date.now().toString(),
                confidence: Math.random(),
              },
            ],
          },
        ],
        responseId: '1d2a7406-d0f8-41bf-ba5d-8bbd78536929',
      },
    };
  }
);
