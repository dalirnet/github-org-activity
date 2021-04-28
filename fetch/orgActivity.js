import _ from "lodash";
import request from "../lib/request.js";

const orgCommit = (repository, keep = {}, page = 1) => {
  return new Promise((resolve) => {
    request
      .get("repos/" + process.env.ORG + "/" + repository + "/commits")
      .query({
        since: new Date(Date.now() - 86400000 * 365).toISOString(),
        per_page: 100,
        page,
      })
      .then(async ({ body, links }) => {
        console.info("orgCommit", "'" + process.env.ORG + "'", "'" + repository + "'", "'" + page + "'", "done");
        const data = _.reduce(
          body,
          (out, row) => {
            const date = _.replace(_.get(row, "commit.author.date", ""), /T.*/, "");
            const member = _.get(row, "author.login", "");
            if (date && member) {
              if (!_.has(out, date)) {
                out[date] = [];
              }
              out[date].push({ type: "commit", repository, member });
            }

            return out;
          },
          keep
        );
        if (_.has(links, "last")) {
          resolve(await orgCommit(repository, data, ++page));
        } else {
          resolve(data);
        }
      })
      .catch(({ message, response: { text = "!" } = {} }) => {
        console.error("orgCommit", "'" + process.env.ORG + "'", "'" + repository + "'", "'" + page + "'", message, text);
        resolve(keep);
      });
  });
};

const orgIssue = (repository, keep = {}, page = 1) => {
  return new Promise((resolve) => {
    request
      .get("repos/" + process.env.ORG + "/" + repository + "/issues")
      .query({
        since: new Date(Date.now() - 86400000 * 365).toISOString(),
        state: "all",
        per_page: 100,
        page,
      })
      .then(async ({ body, links }) => {
        console.info("orgIssue", "'" + process.env.ORG + "'", "'" + repository + "'", "'" + page + "'", "done");
        const data = _.reduce(
          body,
          (out, row) => {
            const date = _.replace(_.get(row, "created_at", ""), /T.*/, "");
            const member = _.get(row, "user.login", "");
            if (date && member) {
              if (!_.has(out, date)) {
                out[date] = [];
              }
              out[date].push({ type: "issue", repository, member });
            }

            return out;
          },
          keep
        );
        if (_.has(links, "last")) {
          resolve(await orgIssue(repository, data, ++page));
        } else {
          resolve(data);
        }
      })
      .catch(({ message, response: { text = "!" } = {} }) => {
        console.error("orgIssue", "'" + process.env.ORG + "'", "'" + repository + "'", "'" + page + "'", message, text);
        resolve(keep);
      });
  });
};

const orgActivity = async (repository, keep) => {
  return await orgIssue(repository, await orgCommit(repository, keep));
};

export default orgActivity;
