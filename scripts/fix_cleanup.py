import pathlib

path = pathlib.Path("app/page.tsx")
content = path.read_text()

old_effect = '''    cardsRef.current.forEach((card) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => handleMouseMove(e, card);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", () => handleMouseLeave(card));
    });
  }, []);'''

new_effect = '''    const cleanups: (() => void)[] = [];
    cardsRef.current.forEach((card) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => handleMouseMove(e, card);
      const onLeave = () => handleMouseLeave(card);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);'''

if old_effect in content:
    content = content.replace(old_effect, new_effect)
    path.write_text(content)
    print("Fixed cleanup successfully")
else:
    print("ERROR: Old effect text not found!")
    print("Looking for:", repr(old_effect[:80]))
