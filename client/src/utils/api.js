import ky from ky;

/** API instance with environment prefix */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});