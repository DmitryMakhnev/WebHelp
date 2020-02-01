/*
 * You please sync this with webpack.DefinePlugin Definitions
 */

declare const WEB_HELP_API_ROOT_URL: string;

declare const WEB_HELP_OUTSIDE_API: {
  selectByPageId: (pageId: TableOfContentsPageId) => boolean;
};
