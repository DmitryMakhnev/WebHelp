import { runInAction } from 'mobx';
import { fetchFromApi } from '../api/fetchFromApi';
import { TableOfContentsModel } from './table-of-contents.model';
import { DeduplicationForSinglePromise } from '../../../lib/deduplications/deduplication-for-single-promise';

export class TableOfContentsFetchingController {
  constructor(private tableOfContentsModel: TableOfContentsModel) {}

  private deduplication = new DeduplicationForSinglePromise(
    (): Promise<TableOfContentsApiResponse> => {
      const { tableOfContentsModel } = this;
      tableOfContentsModel.fetchingDataState.fetch();

      return fetchFromApi<TableOfContentsApiResponse>(
        `${WEB_HELP_API_ROOT_URL}/2019.3/HelpTOC.json`,
      ).then(
        tableOfContentsResponse => {
          runInAction(() => {
            tableOfContentsModel.setData(tableOfContentsResponse).fetchingDataState.success();
          });
          return tableOfContentsResponse;
        },
        (error: Error) => {
          runInAction(() => {
            tableOfContentsModel.setDataFetchingError(error).fetchingDataState.fail();
          });
          // it's painfully fro me to work with errors handling without Either (https://www.youtube.com/watch?v=T6Os27MKUCQ)
          // but for this task I'm really trying
          throw error;
        },
      );
    },
  );

  fetch(): Promise<TableOfContentsApiResponse> {
    return this.deduplication.run();
  }

  runFetching() {
    this.fetch().catch(() => {
      // TODO [dmitry.makhnev]: log error
    });
  }
}
