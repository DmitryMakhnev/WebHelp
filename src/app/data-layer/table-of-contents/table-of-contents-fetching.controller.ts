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
          tableOfContentsModel.setData(tableOfContentsResponse).fetchingDataState.success();
          return tableOfContentsResponse;
        },
        (error: Error) => {
          tableOfContentsModel.setDataFetchingError(error).fetchingDataState.fail();
          throw error;
        },
      );
    },
  );

  fetch(): Promise<TableOfContentsApiResponse> {
    return this.deduplication.run();
  }
}
