module.exports = {

  slug:'sap_mis1',
  name: 'SAP MIS1',
  description: 'Hello something.',
  inputs: {
    file: {
      name: "SAP MIS Report",
      description: "Upload Daily SAP MIS Report",
      type: 'file',
      required:true
    },
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
  fn: async function (ml,{file,id,id2}) {
    ml.log('\n\n\n\n\n=====================');
    ml.log('looks like everything is done');
    ml.log('filename: '+file.fd)
    // ml.log(file);
    ml.log(JSON.stringify(file,2,2));
    ml.log(id);
    ml.log(id2);
    return 'all done';
  }
};

