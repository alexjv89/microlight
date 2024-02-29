module.exports = {

  slug:'process_master_data',
  name: 'Process master data',
  description: 'Hello something.',
  inputs: {
    // filename: {
    //   description: 'filename of the excel file',
    //   type: 'string',
    //   required:true
    // }
    id:{
      description:'ID of the master data version',
      type:'number',
      required:true
    }
  },

  fn: async function ({id}) {
    console.log('looks like everything is done');
    return 'all done';
  }
};

