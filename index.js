import _ from "lodash";
import orgRepository from "./fetch/orgRepository.js";
import orgActivity from "./fetch/orgActivity.js";

let data = {};
for (let repository of await orgRepository()) {
  data = await orgActivity(repository, data);
}

let extract = {
  members: {},
  repositories: {},
  commits: 0,
  issues: 0,
};
let calendar = {};
for (let day = 1; day <= 365; day++) {
  const key = _.replace(new Date(Date.now() - 86400000 * day).toISOString(), /T.*/, "");
  if (_.has(data, key)) {
    _.set(calendar, key, data[key].length);
    extract = _.reduce(
      data[key],
      (out, { type, repository, member }) => {
        // update member
        if (!_.has(out.members, member)) {
          out.members[member] = 0;
        }
        out.members[member] += 1;

        // update repository
        if (!_.has(out.repositories, repository)) {
          out.repositories[repository] = 0;
        }
        out.repositories[repository] += 1;

        // update commits or issues
        if (type == "commit") {
          out.commits += 1;
        } else if (type == "issue") {
          out.issues += 1;
        }

        return out;
      },
      extract
    );
  } else {
    _.set(calendar, key, 0);
  }
}

console.log(extract);
console.log(calendar);
