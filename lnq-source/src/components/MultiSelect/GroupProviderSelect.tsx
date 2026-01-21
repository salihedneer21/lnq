import { ActionMeta } from "react-select";
import MultiSelect from "./MultiSelect";
import { useGetProvidersInGroup } from "../../api/GroupApi";
import { useMemo } from "react";

interface Props {
  groupId: string;
  onChange?: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void;
}

const GroupProviderSelect: React.FC<Props> = ({ groupId, onChange }) => {
  const { data, isLoading: isGettingProvidersInGroup } = useGetProvidersInGroup(
    groupId,
    1,
    0,
    {
      status: "accepted",
    },
  );

  const providers = data?.providers;

  const options = useMemo(() => {
    return (providers ?? []).map((provider) => ({
      value: provider.user.providerId,
      label: `${provider.user.lastName} ${provider.user.firstName} (${provider.user.providerId})`,
    }));
  }, [providers]);

  return (
    <MultiSelect
      isDisabled={isGettingProvidersInGroup}
      options={options}
      placeholder="Select Provider or Search by Name or NPI"
      closeMenuOnSelect={false}
      onChange={onChange}
      isClearable
      isMulti
      blurInputOnSelect={false}
      menuZIndex={20}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          minHeight: "56px",
          height: "56px",
        }),
        valueContainer: (baseStyles) => ({
          ...baseStyles,
          height: "56px",
          padding: "0 6px",
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          margin: "0px",
        }),
        indicatorSeparator: (baseStyles) => ({
          ...baseStyles,
          display: "none",
        }),
        indicatorsContainer: (baseStyles) => ({
          ...baseStyles,
          height: "56px",
        }),
      }}
    />
  );
};

export default GroupProviderSelect;
