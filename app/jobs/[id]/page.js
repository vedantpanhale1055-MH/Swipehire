"use client";

import { useRouter, useParams } from "next/navigation";
import JobDetail from "@/components/JobDetail/JobDetail";
import mockJobs from "@/lib/mockJobs";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const job = mockJobs.find((j) => j.id === params.id);

  return <JobDetail job={job} onBack={() => router.back()} />;
}