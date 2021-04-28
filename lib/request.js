import _ from "lodash";
import dotenv from "dotenv";
import superagent from "superagent";

dotenv.config();

export default superagent
  .agent()
  .use((request) => {
    return _.update(request, "url", (path) => "https://api.github.com/" + path);
  })
  .set("User-Agent", "Github organization activity (https://github.com/dalirnet/github-org-activity)")
  .auth(process.env.USER, process.env.PASS);
