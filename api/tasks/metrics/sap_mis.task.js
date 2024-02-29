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
    ml.markdown(`#### About uploaded file:
      - **File name:** 02. Production MIS With Value (India)_32_5305746647329959689.xlsx
      - **Date:** 2024-02-25
      - **location:** india
      - **Contains sheets:** Summary, Detail, WIP, RM, CONSUMABLE, SPARE, RM Purchase, CONSUMABLE Purchase, SPARE Purchase
    `)
    ml.json(file);
    ml.json({name:'alex',city:'Bengaluru'});
    ml.log(id);
    ml.log(id2);
    return 'all done';
  }
};

