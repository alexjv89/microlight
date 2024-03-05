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
    // id:{
    //   description:'ID of the master data version',
    //   type:'number',
    //   required:true
    // }
  },
  schedule:{
    crontime:'30 6 * * *',
    timezone:'Asia/Kolkata',
  },
  fn: async function (ml,{id}) {
    ml.log('looks like everything is done - '+new Date().toISOString());
    return 'all done';
  }
};

