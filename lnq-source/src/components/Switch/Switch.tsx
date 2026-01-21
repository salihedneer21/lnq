import switchOff from "../../assets/icons/switchOff/switchOff.svg";
import switchOn from "../../assets/icons/switchOn/switchOn.svg";
import "./switch.css";

interface Props {
  isToggled: boolean;
  disabled?: boolean;
  onToggle?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
  customImage?: string;
}

const Switch: React.FC<Props> = ({
  isToggled,
  disabled = false,
  onToggle,
  id,
  customImage,
}) => {
  return (
    <label className="toggle-switch">
      <input
        id={id}
        name="switch"
        type="checkbox"
        checked={isToggled}
        onChange={onToggle}
        disabled={disabled}
        readOnly
      />
      <span className="switch">
        <img
          className="switch-img"
          src={customImage ?? (isToggled ? switchOn : switchOff)}
          alt="switch"
        />
      </span>
    </label>
  );
};

export default Switch;
