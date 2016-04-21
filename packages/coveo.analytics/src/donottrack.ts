// Read the Mozilla Do Not Track Field Guide
// (https://developer.mozilla.org/en-US/docs/Web/Security/Do_not_track_field_guide),
// for information on how to use the donottrack
// gathering data of actions of an user as long as it is not associated to the
// identity of that user, doNotTrack is not enabled here.
export const doNotTrack = [true, 'yes', '1'].indexOf( (<any>navigator).doNotTrack || (<any>navigator).msDoNotTrack || (<any>window).doNotTrack);

export default doNotTrack;
