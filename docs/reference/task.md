# Task

Expected name of a task file - `*.task.js`. 

Task file is expected to be a js file that exports the folowing object:
```
module.exports ={
    slug:'check_duplicate_and_missing_por_numbers',
    name: 'Check duplicate and missing POR numbers',
    description: 'Check duplicate and missing POR numbers (Exponent Energy)',
    inputs: [],
    schedule:{
        crontime: '15 08 * * *',
        timezone:'Asia/Kolkata',
    },
    fn: async function (ml) {
        // function that does the job
        return 'all done';
    }
            
}
```

# Task keys

| key         | about                                                                                                                                                                    | required? | default |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|---------|
| slug        | unique key that is used to refer to the task. It should unique across all tasks in all folders                                                                           | yes       |         |
| name        | Human readable name for the task                                                                                                                                         |           |         |
| description | Quick description of the task. This will be shown inline with the name of the task                                                                                       |           |         |
| docs        | Write detailed documentation of this task. This will shown on the right side bar in the UI.                                                                              |           |         |
| inputs      | json object defines configs for inputs that are accepted by this task. The configs also define how the input is displayed in the UI and the validations that will be run |           | {}      |
| schedule    | Json object to specify crontime and timezone to run the task on schedule                                                                                                 | no        | {}      |
| fn          | function that is executed when the task is triggered. This takes 2 arguments. ml & inputs                                                                                | yes       |         |




## Inputs

The following inputs are supported
- `number` - any number input from user
- `string` - any string input from user
- `dropdown` - Users can choose from a list
- `file` - user can upload a file
