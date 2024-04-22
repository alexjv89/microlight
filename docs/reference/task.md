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






## Inputs

The following inputs are supported
- `number` - any number input from user
- `string` - any string input from user
- `dropdown` - Users can choose from a list
- `file` - user can upload a file
