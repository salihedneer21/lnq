import ReactMultiSelect, { GroupBase, Props } from "react-select";

interface MultiSelectProps<Option, IsMulti extends boolean, Group extends GroupBase<Option>>
  extends Props<Option, IsMulti, Group> {
  menuZIndex?: number;
}

const MultiSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: MultiSelectProps<Option, IsMulti, Group>,
) => {
  const { styles, menuZIndex, closeMenuOnSelect, ...otherProps } = props;
  return (
    <ReactMultiSelect
      styles={{
        ...styles,
        container: (baseStyles) => ({
          ...baseStyles,
          width: "100%",
          textAlign: "left",
          borderColor: "white",
        }),
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "darkBlue2.800",
        }),
        valueContainer: (baseStyles) => ({
          ...baseStyles,
          paddingLeft: "12px",
        }),
        dropdownIndicator: (baseStyles) => ({
          ...baseStyles,
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "#20213c",
          boxShadow: "0 7px 14px 0 rgba(0, 0, 0, 0.16)",
          borderRadius: "16px",
          ...(menuZIndex && { zIndex: menuZIndex }),
        }),
        placeholder: (baseStyles) => ({
          ...baseStyles,
          color: "white",
          fontSize: "16px",
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          color: "white",
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: "white",
        }),
        option: (baseStyles, { isFocused, isSelected }) => {
          let backgroundColor: string | undefined = undefined;
          if (isSelected) {
            backgroundColor = "#fcde1a"; // Background color for selected option
          } else if (isFocused) {
            backgroundColor = "#fffccacc"; // Background color for highlighted option
          }

          return {
            ...baseStyles,
            ...(backgroundColor && { backgroundColor }),
            color: isSelected || isFocused ? "#1f2349" : "#CFD6E1",
          };
        },
      }}
      closeMenuOnSelect={closeMenuOnSelect ?? false}
      {...otherProps}
    />
  );
};

export default MultiSelect;
