import React from "react";
import { Image, ImageProps } from "@chakra-ui/react";
import assetImages from "../../constants/images";

interface LogoProps extends Omit<ImageProps, "src" | "alt"> {
  variant?: "default" | "small" | "large";
}

export const Logo: React.FC<LogoProps> = ({ variant = "default", ...props }) => {
  const getLogoSize = () => {
    switch (variant) {
      case "small":
        return "120px";
      case "large":
        return "200px";
      default:
        return "160px";
    }
  };

  return (
    <Image
      src={assetImages.Logo}
      alt="LnQ Logo"
      width={getLogoSize()}
      objectFit="contain"
      {...props}
    />
  );
};

export default Logo;
