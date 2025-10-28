define(['app/store/user','app/brands/services/logHelper'], 
function (user,logHelper) {
return {    
   formatDate: (function (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-indexed)
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDate = date.toLocaleDateString();
    logHelper.logInfo("formatted Date: " + `${year}${month}${day}${hours}${minutes}${seconds}`);
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }),

  
  getCurrentUser: (function () {
    var currentUser
    console.log('Inside getCurrentUser: ')
    var ctx = new SP.ClientContext.get_current()
    console.log('Inside getCurrentUser: 2' + ctx)
    var web = ctx.get_web()
    console.log('Inside getCurrentUser: 3 ' + web)
    currentUser = web.get_currentUser()
    console.log('Current User: ' + JSON.stringify(currentUser));
   return currentUser;
  }),
  
  triggerWorkflow: (function (store, workFlowType, hasAttachment, fileName) {
        try {
      console.log('Inside triggerWorkFlow: ' + workFlowType)
      var siteUrl =
        'https://irbpartners.sharepoint.com/sites/RetailTechDeploymentDev/';
      const currentUser = 'clayton.gause@inspirebrands.com';

      var clientContext = new SP.ClientContext(siteUrl)
      var oList = clientContext
        .get_web()
        .get_lists()
        .getByTitle('WorkFlowTriggerRequest')

      var itemCreateInfo = new SP.ListItemCreationInformation()
      this.oListItem = oList.addItem(itemCreateInfo)

      const newDate = new Date()
      const formattedDate = this.formatDate(newDate)

      var title = store + '-' + workFlowType + '-' + formattedDate

      oListItem.set_item('Title', title)
      oListItem.set_item('Store', store)
      oListItem.set_item('WFType', workFlowType)
      oListItem.set_item('RequestBy', currentUser)
      oListItem.set_item('DateRequested', new Date())
      if (hasAttachment === true) {
        this.oListItem.set_item('HasAttachment', hasAttachment)
        this.oListItem.set_item('AttachmentFileName', fileName)
      }

      console.log('Before updating the list:' + oList)
      oListItem.update()

      clientContext.load(oListItem)

      clientContext.executeQueryAsync(
        //Success callback
        () => {
          console.log('Successfully created trigger request')
          alert('Workflow Trigger Created')
        },
        //Error callback
        (sender, args) => {
          console.error('An error occured:', args.get_message())
          alert('Error creating trigger')
        }
      )

      return true;
    } catch (error) {
return false;

    }
  })
    }
})


