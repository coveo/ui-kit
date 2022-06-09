module.exports = {
    batchName: 'Atomic visual tests',
    showLogs: false,
    failCypressOnDiff: false,
    apiKey: `${process.env.APPLITOOLS_API_KEY}`,
    isDisabled: false,
    browser: [
        {width: 800, height: 600, name: 'chrome'},
        {width: 700, height: 500, name: 'firefox'},
        {width: 1024, height: 768, name: 'edgechromium'},
        {width: 800, height: 600, name: 'safari'},
        {deviceName: 'iPhone X', screenOrientation: 'portrait'},
        {deviceName: 'Pixel 2', screenOrientation: 'portrait'}
    ],
    visualGridOptions: {
        polyfillAdoptedStyleSheets: true
    }
}
