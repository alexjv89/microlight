module.exports = {

  slug:'sap_mis',
  name: 'SAP MIS',
  description: 'Hello something.',
  inputs: {
    // filename: {
    //   description: 'filename of the excel file',
    //   type: 'string',
    //   required:true
    // }
    id:{
      name:'MD version no',
      description:'ID of the master data version',
      type:'number',
      // default:3,
      required:true
    },
    id2:{
      name:'MD version no',
      description:'ID of the master data version',
      type:'number',
      required:false
    }
  },
  fn: async function (microlight,{id,id2}) {
    microlight.log('\n\n\n\n\n=====================');
    for(var i=0;i<10000;i++){
      microlight.log('yo');
    }
    microlight.log('looks like everything is done');
    microlight.log(id);
    microlight.log(id2);
    return 'all done';
  }
};

