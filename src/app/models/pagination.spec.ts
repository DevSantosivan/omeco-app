import { paginate } from './pagination';
describe('1-based bounded pagination', () => {
  it('clamps invalid page and page size and returns coherent metadata', () => {
    const values = Array.from({ length: 27 }, (_, i) => i);
    expect(paginate(values, { page: 99, pageSize: 10 })).toMatchObject({
      page: 3,
      totalItems: 27,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true,
      items: values.slice(20),
    });
    expect(paginate(values, { page: -2, pageSize: 3 }).pageSize).toBe(10);
    expect(paginate([], { page: 0, pageSize: 10 }).items).toEqual([]);
  });
});
