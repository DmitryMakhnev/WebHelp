import { action, observable, runInAction } from 'mobx';
import { MobXFetchingDataStateModel } from '../../../lib/fetching-data-state/integrations/mobx/mob-x-fetching-data-state-model';

export class TableOfContentsModel {
  fetchingDataState = new MobXFetchingDataStateModel();

  @observable.ref
  dataFetchingError: Error | null = null;

  @action
  setDataFetchingError(errorOrNull: Error | null): TableOfContentsModel {
    this.dataFetchingError = errorOrNull;
    return this;
  }

  @observable.ref
  data: TableOfContentsApiResponse | null = null;

  @action
  setData(data: TableOfContentsApiResponse): TableOfContentsModel {
    this.data = data;
    return this;
  }
}

export function createTableOfContentsModel() {
  return runInAction(() => new TableOfContentsModel());
}
