# Sailsjs starter project

## About

I have build so many services with sailsjs that I noticed myself installing sails and copying a number of files from previous projects. Sails allows you to configure it how ever you please, but I have notices time and again, I keep using these set of configurations again and again. 

## Installation
```shell
degit https://github.com/alexjv89/sailsjs-boilerplate <app_name> 
```

## Upgrade 
This starter project is updated over time(version upgrades, bug fixes, new features etc.). Use degit to pull the latest code and choose to commit the changes you like to keep. 
```shell
degit https://github.com/alexjv89/sailsjs-boilerplate <app_name> --force
```

## More than sails
The following configurations are chosen and reused. 
- mailgun - for send email
- postgres - for database
- redis - for session storage and bull queue
- bull queue - for queue operations

this starter project comes with 
- configs for logs
- configs for email
- configs for authentication and authorisation
- configs for session managment


Dont like this configuration, feel free to tweet it and save it as your preferred configurations while building micro services. 