import { getNavigationItem } from "@/components/layout/navigation";

const page = getNavigationItem("/profile");

function Profile() {
  return (
    <section className="max-w-2xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-violet-950">
        {page.title}
      </h2>
      <p className="text-sm leading-6 text-muted-foreground">{page.description}</p>
    </section>
  );
}

export default Profile;
