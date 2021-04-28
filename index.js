import _ from "lodash";
import dotenv from "dotenv";
import superagent from "superagent";

dotenv.config();

const request = superagent
  .agent()
  .use((request) => {
    return _.update(request, "url", (path) => "https://api.github.com/" + path);
  })
  .set(
    "User-Agent",
    "Github organization activity (https://github.com/dalirnet/github-org-activity)"
  )
  .auth(process.env.USER, process.env.PASS);

// request("orgs/beeptory/repos/beeptory/icon/collaborators")
const fetchCommits = (repo, keep = {}, page = 1) => {
  return new Promise((resolve) => {
    request
      .get("repos/beeptory/" + repo + "/commits")
      .query({ per_page: 100, page })
      .then(async ({ body, links }) => {
        console.info(
          "fetch",
          "commits",
          "'" + repo + "'",
          "page",
          "'" + page + "'",
          "done"
        );
        const data = _.reduce(
          body,
          (total, { commit }) => {
            const date = _.replace(commit.author.date, /T.*/, "");
            if (date) {
              if (!_.has(total, date)) {
                total[date] = [];
              }
              total[date].push({
                author: commit.author.email,
                message: commit.message,
              });
            }

            return total;
          },
          keep
        );
        if (_.has(links, "last")) {
          resolve(await fetchCommits(repo, data, ++page));
        } else {
          resolve(data);
        }
      })
      .catch(({ message, response: { text = "!" } = {} }) => {
        console.error(
          "fetch",
          "commits",
          "'" + repo + "'",
          "page",
          "'" + page + "'",
          message,
          text
        );
        resolve(keep);
      });
  });
};

console.log(await fetchCommits("icon"));
