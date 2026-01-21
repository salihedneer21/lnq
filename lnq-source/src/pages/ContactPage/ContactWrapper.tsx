import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const ContactWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/settings?tab=contact", { replace: true });
  }, [navigate]);

  return null;
};
