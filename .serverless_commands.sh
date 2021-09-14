#!/bin/bash
#sls print to see resolved yaml

slsh(){
    if [ $1 == 'new' ]
    then
        parent=$(cd ../ && pwd) 
        parent=${parent##*/}
        if [ $parent == "services" ]
        then
        # move this to under the first if
            if [ $2 == 'function' ]
                then sls create function --function $3 --handler src/functions/$3.$3 --path src/tests/
            fi
        else
            echo "Use this command from the directory of the service where you want to add a function"
        fi
        # use front root (backend)
        if [ $2 == 'service' ]
            then sls create --template-path servicetemplate --path services/$3 
        fi
    fi
    if [ $1 == "test" ]
        then npx mocha src/tests
    fi
}


# export newFunction


