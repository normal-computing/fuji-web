import { UnorderedList, ListItem } from "@chakra-ui/react";

export default function Notes({ notes }: { notes: string[] | undefined }) {
  if (!notes || notes.length === 0) {
    return null;
  }
  return (
    <UnorderedList fontSize="0.8rem" styleType="circle">
      {notes.map((note, index) => (
        <ListItem key={index}>{note}</ListItem>
      ))}
    </UnorderedList>
  );
}
