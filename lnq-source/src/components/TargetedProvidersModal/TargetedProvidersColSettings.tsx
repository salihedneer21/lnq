export const TargetedProvidersColSettings: React.FC<{ showSwitch?: boolean }> = ({
  showSwitch = true,
}) => (
  <colgroup>
    <col span={1} style={{ width: "calc(100% -10rem)" }}></col>
    {showSwitch && <col span={1} style={{ width: "10rem" }}></col>}
  </colgroup>
);
