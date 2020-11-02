import {formattedCustomDataFromArray} from "./formatted-custom-data-from-array";

describe('#customDataFromArray', () => {
    it("returns an empty string for an empty array", () => {
        expect(formattedCustomDataFromArray([])).toEqual("");
    });

    it("returns the correct string for a valid array", () => {
        expect(formattedCustomDataFromArray(["t", "test"])).toEqual("t;test");
    });

    it("correctly truncates the data when it contains more than 256 characters", () => {
        const longString = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,";
        const rawData = ["1", longString]
        expect(formattedCustomDataFromArray(rawData)).toEqual(longString);
    });
;});