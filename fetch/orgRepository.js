import _ from "lodash";
import request from "../lib/request.js";

const orgRepository = (keep = [], page = 1) => {
  return new Promise((resolve) => {
    request
      .get("orgs/" + process.env.ORG + "/repos")
      .query({ per_page: 100, page })
      .then(async ({ body, links }) => {
        console.info("orgRepository", "'" + process.env.ORG + "'", "page", "'" + page + "'", "done");
        const data = _.reduce(
          body,
          (out, { name }) => {
            out.push(name);

            return out;
          },
          keep
        );
        if (_.has(links, "last")) {
          resolve(await orgRepository(repo, data, ++page));
        } else {
          resolve(data);
        }
      })
      .catch(({ message, response: { text = "!" } = {} }) => {
        console.error("orgRepository", "'" + process.env.ORG + "'", "page", "'" + page + "'", message, text);
        resolve(keep);
      });
  });
};

export default orgRepository;
