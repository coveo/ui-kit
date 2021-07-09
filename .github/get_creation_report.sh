#!/bin/bash
# Get the command for the report
report_command=$(echo $1 | cut -d '"' -f 2)


# Get current status from the report
temp_status=$($report_command -v sfdc.integration.devv2.hub@coveo.com | sed -n 's/.*Status//p')

# sleep for 1 sec, generate report as long as status != Success
until [ $temp_status == "Success" ]
do 
    if [ $temp_status == "Error" ]
    then 
        echo "An error occured in the creation of the package"
        break
    else
        sleep 1
        temp_status=$($report_command -v sfdc.integration.devv2.hub@coveo.com | sed -n 's/.*Status//p')
    fi
done

# After success, show report and save to json file
if [ $temp_status == "Success" ]
then 
    $report_command --json -v sfdc.integration.devv2.hub@coveo.com  > create_package_result.json
    cat create_package_result.json
fi
