import { Card, CardBody } from "@nextui-org/react";

export default function NativeNearDashboard(props) {
  const { walletInfo, balance } = props;
  
  return (
    <Card>
      <CardBody>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Account ID</h3>
            <p>{walletInfo?.accountId}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Balance</h3>
            <p>{balance} NEAR</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}