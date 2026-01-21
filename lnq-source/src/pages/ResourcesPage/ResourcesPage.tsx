import ResourceGroup from "./components/ResourceGroup";
import { resourceGroups } from "../../constants/resources";

const ResourcesPage: React.FC = () => {
  return (
    <>
      {resourceGroups.map((r, index) => (
        <ResourceGroup key={index.toString()} {...r} />
      ))}
    </>
  );
};

export default ResourcesPage;
