import { uid as secure } from 'uid/secure';

export const genUid = () => {
  return secure(32);
};
