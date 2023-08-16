import { getIDToken } from "@actions/core";
import { context, getOctokit } from "@actions/github";

const commentIdentifier = `<!-- bicep-action-id -->`;

export async function addOrUpdateComment(comment: string) {
  const token = await getIDToken();
  const {
    issue: { number: issue_number },
    repo: { owner, repo: repo }
  } = context;
  const { rest } = getOctokit(token);

  const { data: comments } = await rest.issues.listComments({
    owner,
    repo,
    issue_number,
  });

  const filteredComment = comments.filter(
    x => x.user?.login === context.actor &&
      x.body &&
      x.body.includes(commentIdentifier));

  const body = `${commentIdentifier}${comment}`;
  if (filteredComment) {
    const { id: comment_id } = filteredComment[0];
    await rest.issues.updateComment({
      owner,
      repo,
      comment_id,
      body
    });
  } else {
    await rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body
    });
  }
}