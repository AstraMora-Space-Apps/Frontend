function UserMessage({ question }: { question: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-card rounded-br-md border border-ember/40 bg-ember/12 px-4 py-3 text-base break-words whitespace-pre-wrap text-foreground sm:max-w-[75%]">
        <span className="sr-only">You asked: </span>
        {question}
      </div>
    </div>
  );
}

export { UserMessage };
