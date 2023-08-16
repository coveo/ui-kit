const { exec } = require('child_process');
const { promisify } = require('util');

module.exports = async () => {
    const promisifyExec = promisify(exec);
    try {
        const {stderr, stdout} = await promisifyExec('git rev-parse --short HEAD');
    
        if (typeof stderr != "string") {
            console.error(stderr);
            process.exit(1);
        }
      
        return stdout;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
