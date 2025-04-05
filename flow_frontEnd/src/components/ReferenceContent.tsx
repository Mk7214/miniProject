import { ExternalLink, FileText, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface ReferenceContentProps {
  resources: Resource[];
}

export const ReferenceContent = ({ resources }: ReferenceContentProps) => {
  // Filter for reference resources
  const referenceResources = resources.filter(resource => 
    resource.type === "article" || 
    resource.type === "documentation" || 
    resource.type === "tutorial"
  );

  if (referenceResources.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 text-center border border-black/70 dark:border-white/20">
        <p className="text-black dark:text-zinc-300">No reference materials available for this topic</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referenceResources.map((resource, index) => (
        <Card key={index} className="bg-white dark:bg-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-black dark:text-white text-lg flex items-center">
              {resource.type === "article" && <FileText className="mr-2 h-4 w-4" />}
              {resource.type === "documentation" && <FileText className="mr-2 h-4 w-4" />}
              {resource.type === "tutorial" && <LinkIcon className="mr-2 h-4 w-4" />}
              {resource.title}
            </CardTitle>
            <CardDescription className="text-black/70 dark:text-zinc-400">
              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-black dark:text-white border-black/70 dark:border-white/20 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400"
              onClick={() => window.open(resource.url, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Resource
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}; 