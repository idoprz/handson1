/**
 * 
 * @On(event = { "CREATE" }, entity = "custloyal_ipSrv.Purchases")
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(request) {
  const { data } = request;
  
  // Calculate reward points
  data.rewardPoints = Math.floor(data.purchaseValue / 10);

  // Update the related customer's total purchase value and total reward points
  const customer = await SELECT.one.from('custloyal_ipSrv.Customers').where({ ID: data.customer_ID });
  if (customer) {
    const updatedCustomer = {
      totalPurchaseValue: customer.totalPurchaseValue + data.purchaseValue,
      totalRewardPoints: customer.totalRewardPoints + data.rewardPoints
    };
    await UPDATE('custloyal_ipSrv.Customers').set(updatedCustomer).where({ ID: data.customer_ID });
  } else {
    throw new Error('Customer not found');
  }
}