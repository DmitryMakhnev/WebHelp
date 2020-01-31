import { NetworkLayerError } from '../errors/network-layer-error';

export function fetchFromApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  return fetch(input, init)
    .then(response => response.json())
    .catch((error: Error) => {
      throw new NetworkLayerError(error.message);
    });
}
