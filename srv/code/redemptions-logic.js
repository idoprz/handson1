/**
 * 
 * @On(event = { "CREATE" }, entity = "custloyal_ipSrv.Redemptions")
 * @param {Object} req - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(req) {
    const { redeemedAmount, customer_ID } = req.data;
    const tx = cds.transaction(req);

    // Fetch the customer's current total reward points and total redeemed reward points
    const [{ totalRewardPoints, totalRedeemedRewardPoints }] = await tx.run(
        SELECT.from('custloyal_ipSrv.Customers')
            .where({ ID: customer_ID })
            .columns('totalRewardPoints', 'totalRedeemedRewardPoints')
    );

    // Check if the customer has enough reward points to redeem
    if (totalRewardPoints < redeemedAmount) {
        req.error(400, 'Insufficient reward points');
        return;
    }

    // Deduct the redeemed amount from the customer's total reward points
    // and add that to his total redeemed reward points
    await tx.run(
        UPDATE('custloyal_ipSrv.Customers')
            .set({
                totalRewardPoints: totalRewardPoints - redeemedAmount,
                totalRedeemedRewardPoints: totalRedeemedRewardPoints + redeemedAmount
            })
            .where({ ID: customer_ID })
    );
};