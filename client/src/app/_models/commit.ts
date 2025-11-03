export interface CommitRow {
    id: string;
    hash: string;
    branch: string;
    message: string;
    date: string;
    repoName: string;
    repoUid: string;
    authorUid: string;
    authorName: string;
    pullrequest: string;
    url: string;
    checksum: string;
  }