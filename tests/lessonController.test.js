const request = require('supertest');
const { app } = require('../src/app');


describe('Lesson API Endpoints', () => {
  it('should return a list of lessons without filters', async () => {
    const res = await request(app).get('/api/lessons');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should validate incorrect date format', async () => {
    const res = await request(app).get('/api/lessons?date=2024-99-99');
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContain('Дата "2024-99-99" имеет некорректный формат или не является действительной датой.');
  });

  it('should validate status parameter', async () => {
    const res = await request(app).get('/api/lessons?status=invalid');
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContain('Параметр status должен быть либо 0, либо 1.');
  });

  it('should return a filtered list of lessons', async () => {
    const res = await request(app).get('/api/lessons?lessonsPerPage=2&page=1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(2);
  });
});
