import nock from 'nock';

export function allowNetConnectTo(hostPattern: RegExp | string) {
  nock.enableNetConnect(hostPattern);
}

export function mockJson(
  baseUrl: string,
  path: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'get',
  status = 200,
  body: unknown = {},
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
) {
  return (nock(baseUrl) as any)[method](path).reply(status, body, headers);
}

export function resetHttpMocks() {
  nock.cleanAll();
}