import { graphql } from '../config/api/graphql';

describe('Rick Search', () => {
  let response: any;

  beforeAll(async () => {
    response = await graphql({
      requestParams: {
        data: {
          query: `query Query ($name: String!) {
          characters(page: 2, filter: { name: $name }) {
            info {
              count
            }
            results {
              name
            }
          }
          location(id: 1) {
            id
          }
          episodesByIds(ids: [1, 2]) {
            id
          }
        }`,
          variables: {"name":"Rick"}
        },
      },
      retryStatusCodes: [500],
    });
  });

  it('should succeed', () => {
    expect(response.status).toBe(200);
  });

  it('should return name include Rick', () => {
    expect(response.data.data.characters.results[0].name).toEqual(
      expect.stringContaining('Rick')
    );
  });
});
