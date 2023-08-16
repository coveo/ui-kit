/**
 * @todo LENS-1125: versionCompare, parseVersion and recursiveVersionCompare functions could be part to a Core helpers file
 * The versionCompare function should be imported in the publish and tag scripts instead
 */

export const versionCompare = (version1, version2) => {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);

  return recursiveVersionCompare(v1, v2, 0);
};

const parseVersion = (version) => {
  return version.split(".").map((num) => parseInt(num, 10));
};

const recursiveVersionCompare = (version1, version2, i) => {
  if (i > version1.length) {
    return 0;
  }

  if (version1[i] === version2[i]) {
    return recursiveVersionCompare(version1, version2, i + 1);
  }

  return version1[i] > version2[i] ? 1 : -1;
};
